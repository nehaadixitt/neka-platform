import sys
import json
import os

# Fix encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

from run_script_evaluation import *

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)
    
    script_file = sys.argv[1]
    script_title = sys.argv[2]
    
    try:
        # Read and analyze script
        script_text = read_script_file(script_file)
        parser = ScriptParser(script_text)
        metrics = parser.get_all_metrics()
        
        # Get AI analysis
        ai_analysis = get_ai_qualitative_analysis(script_text, metrics)
        
        # Calculate final score
        ai_scores = {'character': 7, 'dialogue': 7, 'originality': 7}
        final_score = calculate_final_score(metrics, ai_scores)
        
        # Generate report to user's Downloads folder (suppress print output)
        import os
        from contextlib import redirect_stdout
        import io
        
        downloads_path = os.path.join(os.path.expanduser('~'), 'Downloads')
        original_cwd = os.getcwd()
        
        try:
            os.chdir(downloads_path)
            # Suppress print statements from generate_report
            with redirect_stdout(io.StringIO()):
                generate_report(script_title, metrics, ai_analysis, final_score)
        finally:
            os.chdir(original_cwd)
        
        # Output JSON for web interface
        result = {
            "success": True,
            "finalScore": final_score,
            "metrics": {
                "format": metrics['format']['score'],
                "grammar": metrics['grammar']['score'],
                "dialogue": metrics['dialogue']['score'],
                "scenes": metrics['scenes']['score'],
                "whitespace": metrics['white_space']['score']
            },
            "aiAnalysis": ai_analysis,
            "pageCount": metrics['page_count'],
            "sceneCount": metrics['scenes']['count'],
            "reportGenerated": True
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()