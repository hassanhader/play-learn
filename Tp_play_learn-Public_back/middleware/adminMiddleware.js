/**
 * Middleware pour vérifier si l'utilisateur est admin
 */
const isAdmin = (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // Vérifier si l'utilisateur est admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required. You do not have permission to perform this action.'
      })
    }

    // L'utilisateur est admin, continuer
    next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check',
      error: error.message
    })
  }
}

module.exports = { isAdmin }
