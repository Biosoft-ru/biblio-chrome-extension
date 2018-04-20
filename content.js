//debugger;

let projectInfo = '<div class="project-info">\n' +
  '    <h3>${name}</h3>\n' +
  '    <p><b>Comment:</b> ${comment}</p>\n' +
  '    <div>\n' +
  '        <a href="http://biblio3.biouml.org/#!form/publications/Compact%20view/Edit/_cat_=2/selectedRows=2">Edit</a>\n' +
  '    </div>\n' +
  '</div>';

load();

function load() {

  const pmids = {
    29669169: {
      "Demo": {
        id: 2,
        comment: "test comment"
      },
      "GTRD": {
        id: 4
      }
    },
    29668588: {
      "Demo": {
        id: 2
      }
    }
  };

//const articles = $('.rprtid dd');

  $('.rprtid dd').each(function() {
    const articleID = $(this).html();
    console.log(articleID);

    let text = '';
    if (articleID in pmids)
    {
      $.each( pmids[articleID], function( name, attr ) {
        text += projectInfo
          .replace('${name}', name)
          .replace('${id}', attr.id)
          .replace('${comment}', attr.comment);
      });
    }
    else
    {
      text = 'Biblio: ' +
        '<a href="http://biblio3.biouml.org/#!form/publications/Compact%20view/Insert" target="_blank">Insert</a>';
    }

    $(this).parent().parent().parent().parent()
      .append( '<div class="biblio-info">' + text + '</div>' );

  });

}
