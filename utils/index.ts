export async function sleep(timeout: number) {
  console.log(`Sleeping for ${timeout} milliseconds...`);
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

// export async function exec(connection: any, command: any) {
//   // return;
//   for (let i = 0; i < command.length; i++) {
//     let res = await connection.exec(command[i]);
//     console.log(`[${params.host}] ${command[i]}`);
//     console.log(res);
//   }
// }

// export async function execClean(connection: any, command: any) {
//   return;
//   for (let i = 0; i < command.length; i++) {
//     let res = await connection.exec(command[i]);
//     console.log(`[${params.host}] ${command[i]}`);
//     console.log(res);
//   }
// }

// export const params = {
//   host: "172.16.9.107",
//   port: 23,
//   shellPrompt: "Switch\\(.*\\)#", // or negotiationMandatory: false
//   // shellPrompt: /#\s*$/,
//   timeout: 30000,
//   debug: true,
//   stripShellPrompt: false,
//   stripControls: true,
//   execTimeout: 5000,
//   disableLogon: true,
// };
