const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
    return blogs.reduce((acc, cur) => acc + cur.likes, 0);
}

const favoriteBlog = (blogs) => {
    if(blogs.length <= 0)
        return ""

    const sorted = [...blogs].sort((a,b) => b.likes - a.likes)
    return sorted[0]._id
}

module.exports = {
  dummy, totalLikes, favoriteBlog
};
