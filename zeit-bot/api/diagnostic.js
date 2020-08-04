export default (req, res) => {
  console.log("Diagnostic requested at: ", new Date().toUTCString());
  res.status(200).send({ response: "OK" });
};
