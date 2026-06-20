import { logger } from "../../src/logger";


test.skip("Logger", ()=>{
logger.debug("Hello Debug")
logger.info("Hello Info");
logger.warn("Hello Warn");
logger.error("Hello Error");
logger.http("Hello HTTP");
})
