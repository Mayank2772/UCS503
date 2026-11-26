const Resource = require("../models/Resource");

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate("createdBy", "name")
      .sort({ featured: -1, createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({ message: "Unable to load resources" });
  }
};

const createResource = async (req, res) => {
  try {
    if (!req.file && !req.body.resourceUrl) {
      return res.status(400).json({
        message: "Please upload a file or provide a resource URL",
      });
    }

    const resource = await Resource.create({
      ...req.body,
      ...(req.file
        ? {
            fileName: req.file.originalname,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            data: req.file.buffer,
            resourceUrl: "",
          }
        : {}),
      createdBy: req.user.id,
    });

    const resourceResponse = resource.toObject();
    delete resourceResponse.data;

    res.status(201).json({
      message: "Resource created",
      resource: resourceResponse,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid resource data",
        errors: Object.values(error.errors).map((validationError) => ({
          field: validationError.path,
          message: validationError.message,
        })),
      });
    }

    console.error("Create resource error:", error);
    res.status(500).json({ message: "Unable to create resource" });
  }
};

const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).select(
      "+data fileName mimeType fileSize resourceUrl",
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!resource.data) {
      if (resource.resourceUrl) return res.redirect(resource.resourceUrl);
      return res.status(404).json({ message: "Resource file not found" });
    }

    const isInlineType =
      resource.mimeType === "application/pdf" ||
      resource.mimeType.startsWith("image/");
    const disposition = req.query.download === "1" || !isInlineType
      ? "attachment"
      : "inline";

    res.set({
      "Content-Type": resource.mimeType || "application/octet-stream",
      "Content-Length": resource.fileSize,
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(resource.fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    });
    res.send(resource.data);
  } catch (error) {
    console.error("Download resource error:", error);
    res.status(500).json({ message: "Unable to access resource file" });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({ message: "Unable to delete resource" });
  }
};

module.exports = {
  getResources,
  createResource,
  downloadResource,
  deleteResource,
};
