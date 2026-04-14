// 日志工具
class Logger {
    constructor() {
        this.prefix = '[Campus Errand]';
    }

    log(message, data = null) {
        console.log(this.prefix, message, data || '');
    }

    info(message, data = null) {
        console.info(this.prefix, message, data || '');
    }

    warn(message, data = null) {
        console.warn(this.prefix, message, data || '');
    }

    error(message, error = null) {
        console.error(this.prefix, message, error || '');
    }

    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.prefix, message, data || '');
        }
    }
}

const logger = new Logger();

export default logger;