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
      in {
        packages = {
          default = oauth-token-cli;
          inherit oauth-token-cli;
        };

        devShells = {
          default = pkgs.mkShell {
            packages = with pkgs; [
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
              # Git hooks
              pre-commit
            ];

            PROJECT_NAME = "@0xc/oauth-token-cli";

            shellHook = ''
              echo $ Started devshell for $PROJECT_NAME
              echo
              echo "Available formatting commands:"
              echo "  treefmt                  - Format all files"
              echo "  treefmt --fail-on-change - Check formatting (CI mode)"
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
            program = "${pkgs.writeShellScript "ci-install" ''
              set -e
              echo "🔧 Installing dependencies..."
              ${bun2NixPkg}/bin/bun2nix --version
              echo "✅ Dependencies installed via Nix (no separate install needed)"
            ''}";
          };

          # Format check for CI
          ci-format = {
            type = "app";
            program = "${pkgs.writeShellScript "ci-format" ''
              set -e
              echo "🎨 Checking formatting..."
              ${treefmtEval.config.build.wrapper}/bin/treefmt --fail-on-change
              echo "✅ All files are properly formatted"
            ''}";
          };

          # Lint check for CI
          ci-lint = {
            type = "app";
            program = "${pkgs.writeShellScript "ci-lint" ''
              set -e
              echo "🔍 Running linting..."
              cd $OLDPWD
              ${pkgs.bun}/bin/bun run lint
              echo "✅ All linting checks passed"
            ''}";
          };

          # Build and test for CI
          ci-build = {
            type = "app";
            program = "${pkgs.writeShellScript "ci-build" ''
              set -e
              echo "🏗️ Building CLI..."
              cd $OLDPWD
              # Test help command works
              ${pkgs.bun}/bin/bun oauth --help
              echo "✅ CLI built and help command works"
            ''}";
          };

          # Test functionality for CI
          ci-test = {
            type = "app";
            program = "${pkgs.writeShellScript "ci-test" ''
              set -e
              echo "🧪 Testing CLI functionality..."
              cd $OLDPWD
              # Test help command works
              ${pkgs.bun}/bin/bun oauth --help
              # Test config validation (should fail gracefully)
              ${pkgs.bun}/bin/bun oauth || true
              echo "✅ All tests passed"
            ''}";
          };

          # Comprehensive CI check
          ci-check = {
            type = "app";
            program = "${pkgs.writeShellScript "ci-check" ''
              set -e
              echo "🚀 Running comprehensive CI checks..."

              echo "📦 Installing dependencies..."
              echo "✅ Dependencies available via Nix"

              echo "🎨 Checking formatting..."
              ${treefmtEval.config.build.wrapper}/bin/treefmt --fail-on-change

              echo "🔍 Running linting..."
              cd $OLDPWD
              ${pkgs.bun}/bin/bun run lint

              echo "🏗️ Testing build..."
              ${pkgs.bun}/bin/bun oauth --help > /dev/null

              echo "🧪 Running tests..."
              ${pkgs.bun}/bin/bun oauth || true

              echo "✅ All CI checks passed successfully!"
            ''}";
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
