module.exports = async () => {
    await global['httpServer'].close()
    return null
}