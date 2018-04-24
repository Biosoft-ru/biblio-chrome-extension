//debugger;

const biblioUrl = 'http://localhost:8200';
const biostoreUrl = 'http://localhost:8080';


const projectTemplate = '<div class="project-info">\n' +
  '    <h3>${name}</h3> <span><b> Imp.: </b>${importance}</span> <a href="http://biblio3.biouml.org/#!form/publications/Compact%20view/Edit/_cat_=2/selectedRows=2">Edit</a>\n' +
  '    <p><b>keyWords: </b>${keyWords}</p>\n' +
  '    <p><b>Comment: </b>${comment}</p>\n' +
  '</div>';

chrome.storage.local.get(['username', 'jwtoken', 'jwtoken_get_time'], function(result) {
  if(result.jwtoken) {
    loadData(result.username, result.jwtoken)
  }else{
    console.log( "Biblio: not authorized" );
  }

  if(new Date().getTime() - result.jwtoken_get_time > 60 * 60 * 1000)
  {
    const data = {
      action: "refreshJWToken",
      jwtoken: result.jwtoken
    };

    $.post( biostoreUrl + "/biostore/permission", data, function( res ) {
      const json = JSON.parse(res);
      chrome.storage.local.set({jwtoken: json.jwtoken, jwtoken_get_time: new Date().getTime()});
      console.log( "Biblio: refreshJWToken success" );
    });
  }
});

function loadData(username, jwtoken)
{
  $.get( biblioUrl + "/api/pubMedInfo?username=" + username + "&jwtoken=" + jwtoken, function( data ) {
    console.log( "data: ", data );
    if(data.type === "ok"){
      load(data);
    }else{
      alert("Biblio error: " + data.message);
    }
  });
}

function load(data) {

  const pmids = {
    29679524: {
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
    29679049: {
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
    //console.log(articleID);

    let text = '';
    let classes;
    if (articleID in pmids)
    {
      let projects = '';
      classes = 'biblio-has-publications';

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

        projects += project;
      });

      text = '<div class="projects">' + projects + '</div>';
    }
    else
    {
      classes = 'biblio-no-has-publications';
      text = 'Biblio: ' +
        '<a href="' + biblioUrl + '/#!form/publications/Compact%20view/Insert" target="_blank">Insert</a>';
    }

    const rprt = $(this).parent().parent().parent().parent();

    $(rprt).append( '<div class="biblio-info">' + text + '</div>' );
    $(rprt).addClass( classes )
  });

}
