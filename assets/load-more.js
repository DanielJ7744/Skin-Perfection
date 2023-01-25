var blogs_on_page = $('.blogs-main-container');
var next_url = blogs_on_page.data('next-url');
var origin_url = blogs_on_page.data('next-url');
var load_more_btn = $('.paginate-btn');
var loadingEnded = false


function loadMoreBlogs(doSearch) {
  $.ajax(
    {
      url: next_url,
      type: 'GET',
      dataType: 'html',

    }
  ).done(function(next_page){
    
    var new_blogs = $(next_page).find('.blogs-main-container');
    var new_url = new_blogs.data('next-url');
    
    if (!doSearch) {
      next_url = new_url;
      blogs_on_page.append(new_blogs.html());
      if((new_url == '') || (origin_url == new_url)) {
        loadingEnded = true
        document.getElementById('loadMorePage').classList.add('inactive')
      }
    } else {
        if (!loadingEnded) {
          next_url = new_url;
          blogs_on_page.append(new_blogs.html());
          searchBlog()
          if((new_url == '') || (origin_url == new_url)) {
            loadingEnded = true
          }
        } else {
          document.getElementById('loadMorePage').classList.add('inactive')
        }
    }
  })

}

var searchInput = document.getElementById("blogSearch");
searchInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    searchBlog()
  }
});

function searchBlog() {
  let searchTerm = document.getElementById("blogSearch").value.toLowerCase();
  const renderedArticles = document.querySelectorAll('.blog-list__item')
  for (const renderedArticle of renderedArticles) {
      if (renderedArticle.getAttribute('title').includes(searchTerm)) {
          renderedArticle.classList.remove('inactive')
      } else {
          renderedArticle.classList.add('inactive')
      }
  }
  loadMoreBlogs(true)
}
