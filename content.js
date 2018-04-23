//debugger;

let projectTemplate = '<div class="project-info">\n' +
  '    <h3>${name}</h3> <span><b> Imp.: </b>${importance}</span> <a href="http://biblio3.biouml.org/#!form/publications/Compact%20view/Edit/_cat_=2/selectedRows=2">Edit</a>\n' +
  '    <p><b>keyWords: </b>${keyWords}</p>\n' +
  '    <p><b>Comment: </b>${comment}</p>\n' +
  '</div>';

chrome.storage.local.get(['jwtoken'], function(result) {
  loadData(result.jwtoken)
});

function loadData(jwtoken)
{
  console.log('loadData: jwtoken' + jwtoken);
}
// $.get( "http://localhost:8080/biostore/permission?action=login&serverName=micro.biouml.org&password=&username=", function( data ) {
//   console.log( "Load was performed.", data );
//   load();
// });

function load() {

  const pmids = {
    29669169: {
      id: 2,
      projects: {
        "Demo": {
          id: 2,
          importance: 3,
          comment: "test comment"
        },
        "GTRD": {
          id: 4,
          importance: 3,
        }
      }
    },
    29668588: {
      id: 3,
      projects: {
        "Demo": {
          id: 2,
          importance: 3,
        }
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
      $.each(pmids[articleID].projects, function( name, attr ) {
        let project = projectTemplate
          .replace('${name}', name)
          .replace('${id}', attr.id)
          .replace('${importance}', attr.importance);

        if(attr.comment !== undefined){
          project = project.replace('${comment}', attr.comment)
        }else{
          project = project.replace('<p><b>Comment: </b>${comment}</p>', '')
        }
        if(attr.keyWords !== undefined){
          project = project.replace('${keyWords}', attr.keyWords)
        }else{
          project = project.replace('<p><b>keyWords: </b>${keyWords}</p>', '')
        }

        text += project;
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
