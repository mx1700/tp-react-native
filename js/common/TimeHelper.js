function now() {
    const d = new Date();
    const localTime = d.getTime();
    const localOffset = d.getTimezoneOffset() * 60000;
    const utc = localTime + localOffset;
    const offset = 8;   //东 8 区
    const beijingTime = utc + (3600000 * offset);
    return new Date(beijingTime);
}

module.exports = {
    now : now
};