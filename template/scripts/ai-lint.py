#!/usr/bin/env python3
"""
AI-Lint: LLM-Native Code Quality Checker
Uses OpenAI to audit code against LLM-native principles.
"""

import os
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any
import openai
from openai import OpenAI


class AILinter:
    def __init__(self, api_key: str = None):
        """Initialize with OpenAI API key."""
        self.client = OpenAI(api_key=api_key or os.getenv('OPENAI_API_KEY'))
        self.rubric = {
            "naming": {
                "description": "Descriptive verbs/nouns, zero ambiguity",
                "weight": 0.2
            },
            "folder_logic": {
                "description": "Domain-oriented, ≤2 levels deep",
                "weight": 0.15
            },
            "comments": {
                "description": "Explains why & guides next steps",
                "weight": 0.2
            },
            "consistency": {
                "description": "Follows established patterns",
                "weight": 0.25
            },
            "llm_readability": {
                "description": "Easy for AI to parse and extend",
                "weight": 0.2
            }
        }

    def analyze_file(self, file_path: Path, content: str) -> Dict[str, Any]:
        """Analyze a single file against LLM-native principles."""
        
        prompt = f"""
You are an expert code reviewer specializing in LLM-native codebases. 
Analyze this file against these criteria (score 1-5 each):

RUBRIC:
1. **Naming** (1-5): Are functions/variables descriptively named with zero ambiguity?
2. **Folder Logic** (1-5): Is the file in the right domain folder with shallow hierarchy?
3. **Comments** (1-5): Do comments explain "why" not just "what"? Guide next steps?
4. **Consistency** (1-5): Does it follow established patterns in the codebase?
5. **LLM Readability** (1-5): Can an AI easily parse, understand, and extend this?

FILE: {file_path}
```{content[:2000]}```

Return ONLY a JSON object with this exact structure:
{{
    "naming": {{"score": X, "reason": "brief explanation"}},
    "folder_logic": {{"score": X, "reason": "brief explanation"}},
    "comments": {{"score": X, "reason": "brief explanation"}},
    "consistency": {{"score": X, "reason": "brief explanation"}},
    "llm_readability": {{"score": X, "reason": "brief explanation"}},
    "overall_score": X.X,
    "suggestions": ["specific improvement 1", "specific improvement 2"]
}}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1000
            )
            
            result = json.loads(response.choices[0].message.content)
            result["file_path"] = str(file_path)
            return result
            
        except Exception as e:
            return {
                "file_path": str(file_path),
                "error": str(e),
                "overall_score": 0
            }

    def scan_directory(self, directory: Path, extensions: List[str] = None) -> List[Dict[str, Any]]:
        """Scan directory for files to analyze."""
        if extensions is None:
            extensions = ['.py', '.ts', '.tsx', '.js', '.jsx']
        
        results = []
        exclude_patterns = {
            'node_modules', '.git', '__pycache__', '.next', 
            'dist', 'build', '.env', 'venv', '.venv'
        }
        
        for file_path in directory.rglob('*'):
            # Skip if file extension not in our list
            if not any(file_path.suffix == ext for ext in extensions):
                continue
                
            # Skip excluded directories
            if any(part in exclude_patterns for part in file_path.parts):
                continue
                
            # Skip files larger than 10KB (context limit)
            if file_path.stat().st_size > 10240:
                continue
                
            try:
                content = file_path.read_text(encoding='utf-8')
                result = self.analyze_file(file_path, content)
                results.append(result)
                print(f"✓ Analyzed: {file_path}")
                
            except Exception as e:
                print(f"✗ Error reading {file_path}: {e}")
                continue
                
        return results

    def generate_report(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary report from analysis results."""
        if not results:
            return {"error": "No files analyzed"}
        
        # Filter out error results
        valid_results = [r for r in results if 'error' not in r]
        
        if not valid_results:
            return {"error": "No valid results"}
        
        # Calculate averages
        totals = {dimension: 0 for dimension in self.rubric.keys()}
        for result in valid_results:
            for dimension in self.rubric.keys():
                if dimension in result:
                    totals[dimension] += result[dimension].get('score', 0)
        
        averages = {
            dimension: round(totals[dimension] / len(valid_results), 2)
            for dimension in self.rubric.keys()
        }
        
        # Calculate weighted overall score
        overall_score = sum(
            averages[dim] * self.rubric[dim]['weight'] 
            for dim in self.rubric.keys()
        )
        
        # Find worst performers
        worst_files = sorted(
            valid_results, 
            key=lambda x: x.get('overall_score', 0)
        )[:5]
        
        # Collect all suggestions
        all_suggestions = []
        for result in valid_results:
            all_suggestions.extend(result.get('suggestions', []))
        
        # Count suggestion frequency
        suggestion_counts = {}
        for suggestion in all_suggestions:
            suggestion_counts[suggestion] = suggestion_counts.get(suggestion, 0) + 1
        
        top_suggestions = sorted(
            suggestion_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        return {
            "summary": {
                "files_analyzed": len(valid_results),
                "overall_score": round(overall_score, 2),
                "target_score": 4.0,
                "needs_improvement": overall_score < 4.0
            },
            "dimension_scores": averages,
            "worst_performers": worst_files,
            "top_suggestions": [s[0] for s in top_suggestions],
            "detailed_results": valid_results
        }

    def save_report(self, report: Dict[str, Any], output_file: Path):
        """Save report to JSON file."""
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"📊 Report saved to: {output_file}")


def main():
    parser = argparse.ArgumentParser(description="AI-Lint: LLM-Native Code Quality Checker")
    parser.add_argument("directory", nargs="?", default=".", help="Directory to analyze")
    parser.add_argument("--output", "-o", default="ai-lint-report.json", help="Output report file")
    parser.add_argument("--api-key", help="OpenAI API key (or set OPENAI_API_KEY env var)")
    parser.add_argument("--extensions", nargs="+", default=['.py', '.ts', '.tsx'], 
                       help="File extensions to analyze")
    
    args = parser.parse_args()
    
    # Check for API key
    api_key = args.api_key or os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OpenAI API key required. Set OPENAI_API_KEY env var or use --api-key")
        return 1
    
    directory = Path(args.directory)
    if not directory.exists():
        print(f"❌ Error: Directory {directory} does not exist")
        return 1
    
    print(f"🔍 Starting AI-Lint analysis of: {directory}")
    print(f"📝 Extensions: {args.extensions}")
    
    linter = AILinter(api_key)
    results = linter.scan_directory(directory, args.extensions)
    
    if not results:
        print("❌ No files found to analyze")
        return 1
    
    print(f"\n📊 Generating report for {len(results)} files...")
    report = linter.generate_report(results)
    
    # Print summary
    if 'error' not in report:
        summary = report['summary']
        print(f"\n🎯 OVERALL SCORE: {summary['overall_score']}/5.0")
        print(f"📊 Target Score: {summary['target_score']}")
        print(f"{'✅' if not summary['needs_improvement'] else '⚠️'} Status: {'EXCELLENT' if not summary['needs_improvement'] else 'NEEDS IMPROVEMENT'}")
        
        print(f"\n📈 DIMENSION SCORES:")
        for dim, score in report['dimension_scores'].items():
            status = "✅" if score >= 4.0 else "⚠️" if score >= 3.0 else "❌"
            print(f"  {status} {dim.replace('_', ' ').title()}: {score}/5.0")
        
        if report['top_suggestions']:
            print(f"\n💡 TOP SUGGESTIONS:")
            for i, suggestion in enumerate(report['top_suggestions'][:5], 1):
                print(f"  {i}. {suggestion}")
    
    # Save detailed report
    linter.save_report(report, Path(args.output))
    return 0


if __name__ == "__main__":
    exit(main())