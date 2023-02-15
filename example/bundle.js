(function (modules) {
  console.log(modules);
  function require(id) {
    // 这个函数解决三件事
    // 1. 为了隔离作用域，我们将不同文件内容放入不同函数中，require函数用来调用这些函数
    // 2. require函数返回module.exports导出的对象
    const [fn, mapping] = modules[id];
    const module = {
      exports: {},
    };
    function localRequire(filePath) {
      const id = mapping[filePath];
      return require(id);
    }
    fn(localRequire, module);
    return module.exports;
  }

  require(0);
})({
  0: [
    function (require, module, exports) {
      // module.exports = {
      //          foo
      // }
      const { foo } = require("./foo.js");
      foo();
      console.log("main.js");
    },
    { "./foo.js": 1 },
  ],
  1: [
    function (require, module, exports) {
      function foo() {
        console.log("foo");
      }
      module.exports = {
        foo,
      };
    },
    {},
  ],
});
