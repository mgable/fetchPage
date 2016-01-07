var nodefs = require("node-fs");

var path = "this/is/the/path";

var mode = "41777";

nodefs.mkdirSync(path, mode, true);