{pkgs, ...}: {
  projectRootFile = "flake.nix";

  programs = {
    # TypeScript, JavaScript, JSON formatting with Biome
    biome.enable = true;

    # YAML formatting
    yamlfmt.enable = true;

    # Nix formatting with Alejandra (primary)
    alejandra.enable = true;

    # Alternative Nix formatting (disabled in favor of Alejandra)
    nixfmt.enable = false;

    # Nix dead code removal
    deadnix = {
      enable = true;
      no-lambda-arg = true;
      no-lambda-pattern-names = true;
    };

    # Nix static analysis and fixes
    statix.enable = true;
  };

  settings = {
    formatter = {
      # Set up priority for Nix formatters to avoid conflicts
      alejandra.priority = 1;
      deadnix.priority = 2;
      statix.priority = 3;
    };
  };
}
