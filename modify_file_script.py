
import argparse

def modify_file(file_path, replacement_data_file_path):
    """
    Modifies a file by deleting specific lines and inserting new code.

    The replacement data file should contain two sections separated by a line '---':
    1. Line numbers to delete, separated by commas.
    2. Code to insert at the position of the first deleted line.

    Args:
    file_path (str): The path to the file to be modified.
    replacement_data_file_path (str): The path to a file containing the replacement data.
    """

    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()

        with open(replacement_data_file_path, 'r', encoding='utf-8') as file:
            replacement_data = file.read()

        # Splitting the replacement data into line numbers and replacement code
        line_numbers_str, replacement_code = replacement_data.split('---', 1)
        line_numbers = [int(num.strip()) for num in line_numbers_str.split(',') if num.strip().isdigit()]

        # Deleting specified lines
        for line_number in sorted(line_numbers, reverse=True):
            if 1 <= line_number <= len(lines):
                del lines[line_number - 1]  # Adjusting index for 0-based indexing

        # Inserting new code
        if line_numbers:
            insert_position = min(line_numbers) - 1  # Adjusting index for 0-based indexing
            lines.insert(insert_position, replacement_code)

        # Writing the modified content back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.writelines(lines)

        print(f"File '{file_path}' has been modified successfully.")

    except FileNotFoundError:
        print(f"Error: The file '{file_path}' or '{replacement_data_file_path}' was not found.")
    except ValueError as e:
        print(f"Value error occurred: {e}")
    except IOError as e:
        print(f"IO error occurred: {e}")

def main():
    parser = argparse.ArgumentParser(description='Modify a file by deleting specific lines and inserting new code.')
    parser.add_argument('file_path', type=str, help='Path to the file to be modified.')
    parser.add_argument('replacement_data_file_path', type=str, help='Path to the file containing the replacement data.')

    args = parser.parse_args()

    modify_file(args.file_path, args.replacement_data_file_path)

if __name__ == '__main__':
    main()
