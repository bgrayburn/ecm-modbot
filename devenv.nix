{ pkgs, lib, config, inputs, ... }:

{
  packages = with pkgs; [
    git
  ];
  languages.typescript.enable = true;
  languages.javascript = {
    enable = true;
    npm = {
      enable = true;
    };
  };
  languages.python.enable = true;

  process.manager.implementation = "overmind";
  processes.ecm-modbot.exec = ''
    npm run dev
  '';

  scripts.get-token.exec = ''
    read -s -p "Password for user $HOMESERVER_USER at $HOMESERVER_URL:" password
    curl $HOMESERVER_URL/.well-known/matrix/client | \
    jq -r '.["m.homeserver"].base_url' | \
    xargs -I {} curl -H "Content-Type: application/json" \
      -d '{"type":"m.login.password", "user":"'$HOMESERVER_USER'", "password":"'$password'"}' \
      "{}/_matrix/client/v3/login" | \
    jq .access_token | \
    xargs -I {} sed -i -e 's/^HOMESERVER_TOKEN=.*/HOMESERVER_TOKEN={}/' .env
  '';

  dotenv.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
