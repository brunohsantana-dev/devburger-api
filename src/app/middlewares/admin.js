const adminMiddleware = (req, res, next) => {
  const isUserAdmin = req.userIsAdmin;

  if (isUserAdmin !== true) {
    return res.status(403).json({
      error: 'Access denied',
    });
  }

  return next();
};

export default adminMiddleware;
