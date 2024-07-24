const express = require("express");
const { createHash } = require("crypto");
const { createConnection } = require("mysql2");
const path = require("path");
const { default: helmet } = require("helmet");
const app = express();

// encryption in one way

const encrypt = (text) => createHash("md5").update(text).digest("hex");

// ensure the valid url

const urlPattern =
  /(https?:\/\/)?(www.)?\w+.\w+(\:\d{4,}\/\w+.php\?\w+\=\w+(&\w+=\w+)?)?/gi;
const testUrl = (url) => urlPattern.test(url);

// set DB connection

const connection = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "codealpha",
});

// security
app.use(helmet());

// set public dir
app.use(express.static(path.join(__dirname, "public")));

// set view engine
app.set("view engine", "ejs");

// parse data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// root

app.get("/", (MReq, MRes) => {
  MRes.status(200).redirect("/add");
});

// add new url

app.get("/add", (MReq, MRes) => {
  MRes.status(200).render("index");
});

app.post("/add", (MReq, MRes) => {
  if (testUrl(MReq.body.theUrl) == true) {
    connection.connect((err) => {
      if (err) {
        return console.error("Error on connecting:", err.message);
      }
    });
    connection.query(
      `SELECT * FROM url_shorter WHERE Main_URL= ?`,
      [rq.body.theUrl],
      (err, res, field) => {
        if (err) {
          return console.error("Error on connecting:", err.message);
        }
        if (res.length > 0) {
          MRes.redirect(res[0]["Main_URL"]);
          MRes.end();
          return;
        }
        const insertQuery = `INSERT INTO url_shorter VALUES (null , ?, ?)`;
        connection.query(
          insertQuery,
          [rq.body.theUrl, encrypt(rq.body.theUrl)],
          (err) => {
            if (err) {
              return console.error("Error executing query:", err.message);
            }
            MRes.render("handle", {
              title: "done",
              content: "http://localhost:8081/" + encrypt(rq.body.theUrl),
              color: "success",
            });
            MRes.end();
            return;
          }
        );
      }
    );
  } else {
    MRes.render("handle", {
      title: "URL not found",
      content: "URL not found",
      color: "danger",
    });
    MRes.end();
    return;
  }
});

// search for existing url

app.get("/search", (MReq, MRes) => {
  MRes.render("search");
});

app.post("/search", (MReq, MRes) => {
  if (!MReq.body.content) return;
  let q = `SELECT Main_URL , Shorter_URL FROM url_shorter WHERE Main_URL like '%${MReq.body.content}%'`;
  connection.query(q, (err, result, f) => {
    if (err) {
      console.log("error " + err.message);
      MRes.json({ message: "bad request" });
      return;
    }
    MRes.status(200).json({ content: result });
  });
});

// redirect url to original url

app.get("/:url", (MReq, MRes) => {
  let url = MReq.params.url;
  let q = `SELECT * FROM url_shorter WHERE Shorter_URL = ?`;
  connection.query(q, [url], (err, reS, fields) => {
    if (err) {
      console.log("Error on fetching" + err.message);
      MRes.end();
      return;
    }
    if (reS.length > 0) {
      MRes.redirect(reS[0]["Main_URL"]);
    } else {
      MRes.render("handle", {
        title: "url not found",
        content: "wrong url check it again",
        color: "danger",
      });
    }
  });
});

// handle wrong url

app.use((MReq, MRes) => {
  MRes.render("handle", {
    title: "page not found",
    content: "page not found",
    color: "danger",
  });
});

app.listen(8081, () =>
  console.log(
    `Example app listening on port ${8081}!\nthe server runs on localhost:`,
    8081
  )
);
