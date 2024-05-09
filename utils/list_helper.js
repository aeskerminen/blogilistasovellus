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

const mostBlogs = (blogs) => {
    if(blogs.length <= 0)
        return {author: "", blogs: 0}

    let m = new Map()

    blogs.forEach((b) => {
        if(!m.has(b.author)) {
            m.set(b.author, {val: 1})
        } else {
            m.get(b.author).val++;
        }
    })

    const entry = [...m.entries()].reduce((acc, cur) => acc[1].val < cur[1].val ? cur : acc)
    return {author: entry[0], blogs: entry[1].val}
}

const mostLikes = (blogs) => {
    if(blogs.length <= 0)
        return {author: "", likes: 0}

    let m = new Map()

    blogs.forEach((b) => {
        if(!m.has(b.author)) {
            m.set(b.author, {val: b.likes})
        } else {
            m.get(b.author).val += b.likes;
        }
    })

    const entry = [...m.entries()].reduce((acc, cur) => acc[1].val < cur[1].val ? cur : acc)
    return {author: entry[0], likes: entry[1].val}
}



module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
};
