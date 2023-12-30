const jwt = require("jsonwebtoken")

const jwtSecret = "secret";

exports.adminAuth = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        if (decodedToken.role !== "Admin") {
          return res.status(401).json({ message: "Not authorized (Admin)" })
        } else {
          next()
        }
      }
    })
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" })
  }
}

exports.userAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
      jwt.verify(token, jwtSecret, (err, decodedToken) => {
        if (err) {
          return res.status(401).json({ message: "Not authorized" })
        } else {
          if (decodedToken.role !== "Basic" && decodedToken.role !== "Admin") {
            return res.status(401).json({ message: "Not authorized (Basic)" })
          } else {
            req.session.user = {
              id: decodedToken.id,
              role: decodedToken.role,
            }
            next()
          }
        }
      })
    } else {
      return res
        .status(401)
        .json({ message: "Not authorized, token not available" })
    }
}


exports.specificUserAuth = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      }
      if (decodedToken.role !== "Basic" && decodedToken.role !== "Admin") {
        return res.status(401).json({ message: "Not authorized (Basic)" })
      }
      const userId = req.params.id[0]
      if (decodedToken.id != userId && decodedToken.role !== "Admin") {
        return res.status(401).json({ message: "Not authorized (Specific)" })
      } else {
        req.session.user = {
          id: decodedToken.id,
          role: decodedToken.role,
        }
        next()
      }
    })
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" })
  }
}