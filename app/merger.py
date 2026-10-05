import os

def merge_nextjs_project(source_dir, output_file):
    # Target file extensions common in Next.js and frontend projects
    valid_extensions = ('.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.json', '.env')
    
    # Standard directories to bypass
    exclude_dirs = {'node_modules', '.next', '.git', 'out', 'build', '.vercel'}

    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(source_dir):
            # Prune excluded directories from the walk
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                if file.endswith(valid_extensions):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, source_dir)

                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()

                        # Write a clear separator and header for each file
                        outfile.write(f"\n{'='*60}\n")
                        outfile.write(f"File: {relative_path}\n")
                        outfile.write(f"{'='*60}\n\n")
                        outfile.write(content)
                        outfile.write("\n")
                    except Exception as e:
                        print(f"Skipping {relative_path}: {e}")

if __name__ == "__main__":
    # Point this to your Next.js project root
    project_directory = "./" 
    merged_output_path = "merged_frontend_code.txt"

    merge_nextjs_project(project_directory, merged_output_path)
    print(f"Project successfully merged into {merged_output_path}")