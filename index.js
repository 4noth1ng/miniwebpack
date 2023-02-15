import fs from "fs";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import path from "path";
import ejs from "ejs";
import { transformFromAst } from "babel-core";
let id = 0;
function createAsset(filePath) {
  // 1. 获取文件内容
  const source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });
  // console.log(source);

  // 2. 获取依赖关系
  const ast = parser.parse(source, {
    sourceType: "module",
  });
  //   console.log(ast);
  const deps = []; // 依赖数组

  traverse.default(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });

  const { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });
  return {
    code,
    deps,
    filePath,
    id: id++,
    mapping: {},
  };
}

function createGraph() {
  // 首先获取入口的依赖关系，然后根据他的依赖得到了依赖图
  //
  const mainPath = "./example/main.js";
  const mainAsset = createAsset(mainPath);
  const queue = []; // 依赖队列
  queue.push(mainAsset);
  //   console.log(mainAsset);
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAsset(path.resolve("./example", relativePath));
      queue.push(child);
      asset.mapping[relativePath] = child.id;
      //   console.log(child);
    });
  }
  return queue;
}
const graph = createGraph();
console.log(graph);

function build(graph) {
  // 根据获得的图，将code转化为ejs模板代码以供浏览器识别
  // 由于浏览器不支持 cjs 所以需要将cjs转化为ejs
  // 根据ejs模板，传入data生成代码，写出代码到dist下的bundle.js
  const template = fs.readFileSync("./bundle.ejs", { encoding: "utf-8" });

  const data = graph.map((asset) => {
    const { id, code, mapping } = asset;
    return {
      id,
      code,
      mapping,
    };
  });
  const code = ejs.render(template, { data }, {});
  fs.writeFileSync("./dist/bundle.js", code);
}
build(graph);
