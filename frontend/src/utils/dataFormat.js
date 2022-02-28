import * as h2p from "html2plaintext";

export const formatDate = (data) => {
  return data.map((d) => {
    d.createdAt = new Date(d.createdAt).toLocaleDateString();
    d.updatedAt = new Date(d.updatedAt).toLocaleDateString();
    return d;
  });
};

export const getUniqueDates = (data, type) => {
  const dateFormattedData = formatDate(data);
  if (type === "createdAt") {
    return [...new Set(dateFormattedData.map((d) => d.createdAt))];
  } else {
    return [...new Set(dateFormattedData.map((d) => d.updatedAt))];
  }
};

export const formatData = (data, type) => {
  const uniqueDates = getUniqueDates(data, type);
  const dateFormattedData = formatDate(data);
  return uniqueDates.map((date) => {
    const count = dateFormattedData.filter((d) => d.createdAt === date).length;
    return {
      date: date,
      count: count,
    };
  });
};

export const getAuthorNameInitials = (author) =>
  author.split(" ").map((np, index) => {
    if (index > 1) return null;
    return np[0];
  });

export const sanitizeSocialURL = (url) => {
  const urlHandles = {
    fb: "https://www.facebook.com/",
    fbAlt: "www.facebook.com/",
    twitter: "https://twitter.com/",
    twitterAlt: "twitter.com/",
    linkedin: "https://www.linkedin.com/in/",
    linkedinAlt: "www.linkedin.com/in/",
  };
  if (url.includes(urlHandles.fb)) {
    return url.replace(urlHandles.fb, "");
  }
  if (url.includes(urlHandles.fbAlt)) {
    return url.replace(urlHandles.fbAlt, "");
  }
  if (url.includes(urlHandles.linkedin)) {
    return url.replace(urlHandles.linkedin, "");
  }
  if (url.includes(urlHandles.linkedinAlt)) {
    return url.replace(urlHandles.linkedinAlt, "");
  }
  if (url.includes(urlHandles.twitter)) {
    return url.replace(urlHandles.twitter, "");
  }
  if (url.includes(urlHandles.twitterAlt)) {
    return url.replace(urlHandles.twitterAlt, "");
  }
  return url;
};

export const countWords = (str) => {
  return str.trim().split(/\s+/).length;
};

export const calculateReadingTime = (str) => {
  return Math.ceil(countWords(str) / 200);
};

export const convertToText = (html) => {
  return h2p(html);
};
