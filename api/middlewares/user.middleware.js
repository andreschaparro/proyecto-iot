export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== "admin") {
        return res.status(403).json({
            message: "Se requiere el rol de administrador"
        })
    }

    next()
}