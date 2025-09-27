{
  description = "@0xc/oauth-token-cli";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    bun2nix = {
      url = "github:baileyluTCD/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    treefmt-nix,
    bun2nix,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
        treefmtEval = treefmt-nix.lib.evalModule pkgs ./nix/treefmt.nix;
        bun2NixPkg = bun2nix.packages.${system}.default;
        inherit (bun2nix.lib.${system}) mkBunDerivation;

        manifest = builtins.fromJSON (builtins.readFile ./package.json);

        oauth-token-cli = mkBunDerivation {
          inherit (manifest) version;
          pname = "oauth-token-cli";
          index = manifest.bin.oauth-token-cli;
          src = ./.;
          bunNix = ./nix/bun.nix;
          buildFlags = ["--compile" "--minify" "--sourcemap"];
        };
        projectPackages = with pkgs; [
          git
          bun
          bun2NixPkg
          # Formatting tools - using compiled treefmt with project config
          treefmtEval.config.build.wrapper
          biome
          yamlfmt
          alejandra
          nixfmt-classic
          deadnix
          statix
        ];

        mkShellApp = {name ? "script.sh", ...} @ opts:
          pkgs.writeShellApplication (opts
            // {
              inherit name;
              runtimeInputs = projectPackages; # TODO: Support additional packages
            });

        mkShellAppPath = opts: let app = mkShellApp opts; in "${app}/bin/${app.name}";
      in {
        packages = {
          default = oauth-token-cli;
          inherit oauth-token-cli;
        };

        devShells = {
          default = pkgs.mkShell {
            packages =
              projectPackages
              ++ [
                # Git hooks
                pkgs.pre-commit
              ];

            PROJECT_NAME = "@0xc/oauth-token-cli";

            shellHook = ''
              echo $ Started devshell for $PROJECT_NAME
              echo
              echo "Available formatting commands:"
              echo "  treefmt                  - Format all files"
              echo "  treefmt --fail-on-change - Check formatting (CI mode)"
              echo
              echo "CI/CD commands (used by GitHub Actions):"
              echo "  nix run .#ci-install     - Check dependencies"
              echo "  nix run .#ci-format      - Check formatting"
              echo "  nix run .#ci-lint        - Run linting"
              echo "  nix run .#ci-build       - Test build"
              echo "  nix run .#ci-test        - Test functionality"
              echo "  nix run .#ci-check       - Run all CI checks"
              echo
              echo "Pre-commit hooks:"
              echo "  pre-commit install       - Install hooks (already done)"
              echo "  pre-commit run --all-files - Run hooks manually"
              echo
              echo "Hooks automatically run on commit to format, lint, and validate all files."
              echo
            '';
          };
        };

        # CI/CD Apps for GitHub Actions
        apps = {
          # Install dependencies in CI
          ci-install = {
            type = "app";
            program = mkShellAppPath {
              text = ''
                echo "📦 Installing dependencies..."
                echo "✅ Dependencies available via Nix"
              '';
            };
          };

          # Format check for CI
          ci-format = {
            type = "app";
            program = mkShellAppPath {
              text = ''
                set -e
                echo "🎨 Checking formatting / linting..."
                treefmt --fail-on-change
                echo "✅ All files are properly formatted and linted"
              '';
            };
          };

          # Build and test for CI
          ci-build = {
            type = "app";
            program = mkShellAppPath {
              text = ''
                set -e
                echo "🏗️ Building CLI..."
                # Build command
                nix build .#oauth-token-cli
                # Test help command works
                nix run .#oauth-token-cli -- --help
                echo "✅ CLI built and help command works"
              '';
            };
          };

          # Test functionality for CI
          ci-test = {
            type = "app";
            program = mkShellAppPath {
              text = ''
                set -e
                echo "🧪 Testing CLI functionality..."
                # Test help command works
                bun oauth --help
                echo "✅ All tests passed"
              '';
            };
          };

          # Comprehensive CI check
          ci-check = {
            type = "app";
            program = mkShellAppPath {
              text = ''
                set -e
                echo "🚀 Running comprehensive CI checks..."

                ${self.apps.${system}.ci-install.program}
                ${self.apps.${system}.ci-format.program}
                ${self.apps.${system}.ci-build.program}
                ${self.apps.${system}.ci-test.program}

                echo "✅ All CI checks passed successfully!"
              '';
            };
          };
        };

        # Expose treefmt for CI and scripts
        formatter = treefmtEval.config.build.wrapper;
        checks = {
          formatting = treefmtEval.config.build.check self;
          # Add build check
          build = oauth-token-cli;
        };
      }
    );
}
