{
  description = "@0xc/oauth-token-cli";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.treefmt-nix.url = "github:numtide/treefmt-nix";
  inputs.bun2nix.url = "github:baileyluTCD/bun2nix";
  inputs.bun2nix.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { self, nixpkgs, flake-utils, treefmt-nix, bun2nix }:
    flake-utils.lib.eachDefaultSystem (system:
      let 
        pkgs = nixpkgs.legacyPackages.${system};
        treefmtEval = treefmt-nix.lib.evalModule pkgs ./treefmt.toml;
        bun2NixPkg = bun2nix.packages.${system}.default;
        mkBunDerivation = bun2nix.lib.${system}.mkBunDerivation;
        
        manifest = builtins.fromJSON (builtins.readFile ./package.json);
        
        oauth-token-cli = mkBunDerivation {
          inherit (manifest) version;
          pname = "oauth-token-cli";
          index = manifest.bin.oauth-token-cli;
          src = ./.;
          bunNix = ./bun.nix;
          buildFlags = [ "--compile" "--minify" "--sourcemap" ];
        };
      in
      {
        packages = {
          default = oauth-token-cli;
          oauth-token-cli = oauth-token-cli;
        };

        devShells = {
          default = pkgs.mkShell {
            packages = with pkgs; [
              git
              bun
              bun2NixPkg
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
