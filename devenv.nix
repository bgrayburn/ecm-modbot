{ pkgs, lib, config, inputs, ... }:

{
  languages.typescript.enable = true;
  languages.javascript = {
    enable = true;
    npm = {
      enable = true;
    };
  };

  dotenv.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
