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

        # Expose treefmt for CI and scripts
        formatter = treefmtEval.config.build.wrapper;
        checks = {
          formatting = treefmtEval.config.build.check self;
        };
      }
    );
}
