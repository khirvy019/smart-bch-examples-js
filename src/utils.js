export async function query(text) {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdout.write(text);
    process.stdin.once("data", function (data) {
      resolve(data.toString().trim())
      process.stdin.pause()
    })
  })
}
