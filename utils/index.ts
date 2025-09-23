export async function sleep(timeout: number) {
  console.log(`Sleeping for ${timeout} milliseconds...`);
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export enum Port {
  A = "<PortA>",
  B = "<PortB>",
  C = "<PortC>",
  D = "<PortD>",
}
