//https://www.ncbi.nlm.nih.gov/pubmed/29618168
biblioAddSelector('.rprt.abstract', function (item) {
  return item.find('.rprtid dd').html()
}, function (item, html) {
  $(html).insertAfter( item.find('.aux') );
});

//https://www.ncbi.nlm.nih.gov/pubmed?linkname=pubmed_pubmed_reviews&from_uid=29618168
biblioAddSelector('.rslt', function (item) {
  return item.find('.rprtid dd').html();
}, function (item, html) {
  item.append(html);
});

//https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3053263/
biblioAddSelector('.ref-list-sec li', function (item) {
  const str = item.find('.ref.pubmed a').attr('href');
  if(str === undefined)return undefined;
  return str.substring(str.lastIndexOf("/") + 1, str.length);
}, function (item, html) {
  item.append(html);
});

biblioStart();