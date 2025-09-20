
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.mysql80
  ];
  env = {
    NODE_ENV = "development";
  };
}
