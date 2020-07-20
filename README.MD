# assembly script contract code template

## compile only

1. clone or download this repository

2. execute `npm install` to install dependencies

3. write your contract code at assembly/index.ts

4. execute command `java -jar cmd-*.jar compile -s assembly/index.ts -o index.wasm -a node_modules/.bin/asc`


## compile and deploy 

1. clone or download this repository

2. execute `npm install` to install dependencies

3. write your contract code at assembly/index.ts

4. configure your tds server at cmd-config.json

5. download latest cmd tool cmd-1.0-SNAPSHOT.jar at [release page](https://github.com/TrustedDataFramework/assembly-script-template/releases)

6. execute command `java -jar cmd-*.jar deploy -c cmd-config.json`

