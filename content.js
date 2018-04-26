//debugger;

const biblioUrl = 'https://biblio3.biouml.org';
const biostoreUrl = 'https://bio-store.org';


const projectTemplate = '<div class="project-info">\n' +
  '    <h3>${name}</h3> <span><b> Imp.: </b>${importance}</span> <b> Status.: </b>${status}</span> ' +
  '<a href="' + biblioUrl + '/#!form/publications/' +
            'Compact%20view/Edit/_cat_=${categoryID}/selectedRows=${publicationID}" target="_blank">Edit</a>\n' +
  '    <p><b>keyWords: </b>${keyWords}</p>\n' +
  '    <p><b>Comment: </b>${comment}</p>\n' +
  '</div>';

chrome.storage.local.get(['username', 'jwtoken', 'jwtoken_get_time'], function(result) {
  if(!result.jwtoken) {
    console.log( "Biblio: not authorized" );
    return;
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

      loadData(result.username, json.jwtoken);
    });
  }else{
    loadData(result.username, result.jwtoken);
  }
});

function loadData(username, jwtoken)
{
  $.post( biblioUrl + "/api/pubMedInfo", {username: username, jwtoken: jwtoken}, function( json ) {
    console.log( "json: ", json );
    if(json.type === "ok"){
      load(json);
    }else{
      alert("Biblio error: " + json.message);
    }
  });
}

function load(json) {

  // const pmids = {
  //   29679524: {
  //     id: 2,
  //     projects: [
  //       {
  //         categoryID: 2,
  //         name: "Demo",
  //         importance: 3,
  //         comment: "test comment"
  //       },
  //       {
  //         categoryID: 4,
  //         name: "GTRD",
  //         importance: 3,
  //       }
  //     ]
  //   },
  //   29679049: {
  //     id: 3,
  //     projects: [
  //       {
  //         categoryID: 2,
  //         name: "Demo",
  //         importance: 3,
  //       }
  //     ]
  //   }
  // };

  $('.rprtid dd').each(function() {
    const articleID = $(this).html();
    //console.log(articleID);

    let text = '';
    let classes;
    if (articleID in json.data)
    {
      let projects = '';
      classes = 'biblio-has-publications';

      $.each(json.data[articleID].projects, function( id, attr ) {
        let project = projectTemplate
          .replace('${name}', attr.name)
          .replace('${categoryID}', attr.categoryID)
          .replace('${publicationID}', json.data[articleID].id)
          .replace('${importance}', attr.importance)
          .replace('${status}', attr.status);

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
        '<a href="' + biblioUrl + '/#!form/publications/Compact%20view/Insert/pmid='+ articleID + '" target="_blank">Insert</a>';
    }

    const rprt = $(this).parent().parent().parent().parent();

    $(rprt).append( '<div class="biblio-info">' + text + '</div>' );
    $(rprt).addClass( classes )
  });

}
