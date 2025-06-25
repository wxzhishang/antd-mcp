#!/usr/bin/env node
import { resolve } from "path";
import server from "./src/index.js";
import { DEFAULT_ANT_DESIGN_EXTRACT_PATH } from "./src/path.js";
import extractAllData from "./src/scripts/extract-docs.js";
import { processComponents } from "./src/scripts/crawl-best-practices.js";
import { generateComponentChangelog } from "./src/scripts/generate.component-changelog.js";

const [command,...restArgs] = process.argv.slice(2);

async function run() {
    try{
        if(!command){
            server();
            return;
        }else if(command === "extract")
        {
            const [antdRepoArg] = restArgs;
            
            const antdRepoPath = resolve(
                antdRepoArg ?? DEFAULT_ANT_DESIGN_EXTRACT_PATH
            )
            await extractAllData(antdRepoPath);
            return;
        }else if(command === "crawl-practices") {
            const componentNames = restArgs.length === 0 ? [] : restArgs;
            await processComponents(componentNames);
            return;
        }else if(command === "generate-component-changelog"){
            generateComponentChangelog();
            return;
        }
        else{
            console.error(`未知命令: ${command}`);
        }
        process.exit(1);
    }catch(error){
        console.error("运行时错误:", error);
        process.exit(1);
    }
}

run();