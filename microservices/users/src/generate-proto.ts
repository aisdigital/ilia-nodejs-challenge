import * as fs from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const PROTO_DIR = join(__dirname, 'shared', 'grpc');
const GENERATED_DIR = join(PROTO_DIR, 'generated');

const PROTO_FILE_PATH = join(PROTO_DIR, 'users.proto');

if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

const PROTO_COMMAND = `
  npx protoc \
    -I=${PROTO_DIR} \
    --plugin=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out=${GENERATED_DIR} \
    --ts_proto_opt=nestJs=true,esModuleInterop=true,forceLong=string \
    ${PROTO_FILE_PATH}
`;

const cleanCommand = PROTO_COMMAND.replace(/\s+/g, ' ').trim();

console.log('Generating gRPC code...');
try {
  execSync(cleanCommand, { stdio: 'inherit' });
  console.log('gRPC generation completed on: ' + GENERATED_DIR);
} catch (error) {
  console.error('gRPC generation failure:', error.message);
  process.exit(1);
}
