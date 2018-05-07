//debugger;

const biblioUrl = 'https://biblio3.biouml.org';
const biostoreUrl = 'https://bio-store.org';

const projectTemplate = '<div class="project-info">\n' +
  '    <h3>${name}</h3> <span><b> Imp.: </b>${importance} <b> Status.: </b>${status}</span> ' +
  '<a href="' + biblioUrl + '/#!form/publications/' +
            'Compact%20view/Edit/_cat_=${categoryID}/selectedRows=${publicationID}" target="_blank">Edit</a>\n' +
  '    <p><b>KeyWords: </b>${keyWords}</p>\n' +
  '    <p><b>Comment: </b>${comment}</p>\n' +
  '</div>';

const biblioSelectors = {};

window.biblioAddSelector = function addBiblioSelector(selector, findID, addFunction)
{
  biblioSelectors[selector] = {
    findID: findID,
    addFunction: addFunction
  }
};

window.biblioStart = function run(){
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
};

function findIDs(username, jwtoken)
{
  for (let selector in biblioSelectors) {
    const items = $(selector);

    if(items.length > 0) {
      let PMIDs = [];
      items.each(function () {
        const PMID = biblioSelectors[selector].findID($(this));
        if(PMID !== undefined)PMIDs.push(PMID);
      });
      loadData(username, jwtoken, PMIDs, selector, biblioSelectors[selector].addFunction);
    }
  }
}

function loadData(username, jwtoken, PMIDs, selector, addFunction)
{
  $.post( biblioUrl + "/api/pubMedInfo", {username: username, jwtoken: jwtoken, PMIDs: PMIDs}, function( json ) {
    console.log( "json for " + selector, json );
    if(json.type === "ok"){
      addInfo(json, selector, addFunction);
    }else{
      alert("Biblio error: " + json.message);
    }
  });
}

function addInfo(json, selector, addFunction) {

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

  const items = $(selector);
  if(items.length > 0) {
    items.each(function () {
      const PMID = biblioSelectors[selector].findID($(this));

      addFunction($(this), getText(PMID, json));

      $(this).addClass(getClasses(PMID, json));
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

      return '<div class="biblio-info"><div class="projects">' + projects + '</div></div>';
    }
    else
    {
      return '<div class="biblio-info">Biblio: ' +
        '<a href="' + biblioUrl + '/#!form/publications/Compact%20view/Insert/pmid='+ PMID + '" ' +
           'target="_blank">Insert</a></div>';
    }
  }

}
