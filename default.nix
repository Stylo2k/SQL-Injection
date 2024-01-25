{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.python38  # You can adjust the Python version as needed
  ];

  shellHook = ''
    # Activate the virtual environment
    virtualenv --python=python3.8 .venv
    source .venv/bin/activate

    pip install njsscan
    curl -sfL https://raw.githubusercontent.com/Bearer/bearer/main/contrib/install.sh | sh
  '';
}
