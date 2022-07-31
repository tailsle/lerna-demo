(async () => {
  const glob = (await import("glob")).default;
  const inquirer = (await import("inquirer")).default;
  const fs = (await import("fs-extra")).default;
  const handlebars = (await import("handlebars")).default;
  const { exec } = (await import("shelljs")).default;
  const path = await import("path");
  const cwd = process.cwd();

  const getPackagePath = () => {
    const packagePaths = glob.sync(path.join(process.cwd(), "packages/*"));
    console.log({ packagePaths });
    return packagePaths.map((item) => item.replace(process.cwd() + "/", ""));
  };

  const choosePackage = async (packages) => {
    console.log(packages);
    const answer = await inquirer.prompt({
      type: "checkbox",
      name: "packages",
      message: "选择你要发布的包",
      choices: [...packages],
    });
    return answer;
  };

  const reWriteLerna = (packages) => {
    const jsonContent = fs.readFileSync(`${cwd}/lerna-template.txt`, "utf-8");
    const jsonResult = handlebars.compile(jsonContent)(packages);
    fs.writeFileSync(`${cwd}/lerna.json`, jsonResult);
  };

  const publish = async () => {
    const packages = getPackagePath();
    const publishPackages = await choosePackage(packages);
    if (publishPackages.packages.length !== 0) {
      reWriteLerna(publishPackages);
      exec("lerna publish", {
        exec: true,
      });
    } else {
      console.log("没有选择包");
    }
  };

  publish();
})();
