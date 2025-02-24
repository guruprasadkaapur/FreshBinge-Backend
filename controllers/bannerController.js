import Banner from "../models/Banner.js";

export const createBanner = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file
      ? `${req.file.destination}${req.file.filename}`
      : null;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: "Title and image are required",
      });
    }

    const banner = await Banner.create({ title, description, image });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the banner",
      data: { error: error.message },
    });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll();
    res.status(200).json({ success: true, banners });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching banners",
      data: { error: error.message },
    });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, banner });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the banner",
      data: { error: error.message },
    });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const image = req.file
      ? `${req.file.destination}${req.file.filename}`
      : null;

    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    banner.title = title || banner.title;
    banner.description = description || banner.description;
    if (image) banner.image = image;

    await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the banner",
      data: { error: error.message },
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    await banner.destroy();

    res
      .status(200)
      .json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the banner",
      data: { error: error.message },
    });
  }
};
