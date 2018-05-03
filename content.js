//debugger;

const biblioUrl = 'https://biblio3.biouml.org';
const biostoreUrl = 'https://bio-store.org';
let abstract;
let rprtArray;

const projectTemplate = '<div class="project-info">\n' +
  '    <h3>${name}</h3> <span><b> Imp.: </b>${importance} <b> Status.: </b>${status}</span> ' +
  '<a href="' + biblioUrl + '/#!form/publications/' +
            'Compact%20view/Edit/_cat_=${categoryID}/selectedRows=${publicationID}" target="_blank">Edit</a>\n' +
  '    <p><b>KeyWords: </b>${keyWords}</p>\n' +
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

      findIDs(result.username, json.jwtoken);
    });
  }else{
    findIDs(result.username, result.jwtoken);
  }
});

function findIDs(username, jwtoken){
  abstract = $('.rprt.abstract');
  if(abstract.length === 1)
  {
    const PMID = abstract.find('.rprtid dd').html();
    console.log("abstract: " + PMID);
    loadData(username, jwtoken, [PMID]);
  }
  else
  {
    console.log("list");
    rprtArray = $('.rprtid dd');

    let PMIDs = [];
    rprtArray.each(function() {
      PMIDs.push($(this).html());
    });
    loadData(username, jwtoken, PMIDs);
  }
}

function loadData(username, jwtoken, PMIDs)
{
  $.post( biblioUrl + "/api/pubMedInfo", {username: username, jwtoken: jwtoken, PMIDs: PMIDs}, function( json ) {
    console.log( "json: ", json );
    if(json.type === "ok"){
      addInfo(json);
    }else{
      alert("Biblio error: " + json.message);
    }
  });
}

function addInfo(json) {

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

  if(abstract.length === 1)
  {
    const PMID = abstract.find('.rprtid dd').html();

    const info = '<div class="biblio-info">' + getText(PMID, json) + '</div>'
    $( info ).insertAfter( abstract.find('.aux') );

    $(abstract).addClass( getClasses(PMID, json) )
  }
  else
  {
    rprtArray.each(function() {
      const PMID = $(this).html();

      const rprt = $(this).parent().parent().parent().parent();

      $(rprt).append( '<div class="biblio-info">' + getText(PMID, json) + '</div>' );
      $(rprt).addClass( getClasses(PMID, json) )
    });
  }

  function getClasses(PMID, json) {
    if (PMID in json.data)return 'biblio-has-publications';
    else return 'biblio-no-publications';
  }

  function getText(PMID, json) {
    if (PMID in json.data)
    {
      let projects = '';

      $.each(json.data[PMID].projects, function( id, attr ) {
        let project = projectTemplate
          .replace('${name}', attr.name)
          .replace('${categoryID}', attr.categoryID)
          .replace('${publicationID}', json.data[PMID].id)
          .replace('${importance}', attr.importance);

        if(attr.status !== undefined){
          project = project.replace('${status}', attr.status)
        }else{
          project = project.replace('<b> Status.: </b>${status}', '')
        }
        if(attr.comment !== undefined){
          project = project.replace('${comment}', attr.comment)
        }else{
          project = project.replace('<p><b>Comment: </b>${comment}</p>', '')
        }
        if(attr.keyWords !== undefined){
          project = project.replace('${keyWords}', attr.keyWords)
        }else{
          project = project.replace('<p><b>KeyWords: </b>${keyWords}</p>', '')
        }

        projects += project;
      });

      return '<div class="projects">' + projects + '</div>';
    }
    else
    {
      return 'Biblio: ' +
        '<a href="' + biblioUrl + '/#!form/publications/Compact%20view/Insert/pmid='+ PMID + '" target="_blank">Insert</a>';
    }
  }

}
