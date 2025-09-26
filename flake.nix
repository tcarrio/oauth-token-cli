{
  description = "@0xc/oauth-token-cli";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.treefmt-nix.url = "github:numtide/treefmt-nix";

  outputs = { self, nixpkgs, flake-utils, treefmt-nix }:
    flake-utils.lib.eachDefaultSystem (system:
      let 
        pkgs = nixpkgs.legacyPackages.${system};
        treefmtEval = treefmt-nix.lib.evalModule pkgs ./treefmt.toml;
      in
      {
        devShells = {
          default = pkgs.mkShell {
            packages = with pkgs; [
              git
              bun
              # Formatting tools
              treefmt
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
              echo "  treefmt        - Format all files"
              echo "  treefmt --check - Check formatting"
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
