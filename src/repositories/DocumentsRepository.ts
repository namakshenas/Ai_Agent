export default class DocumentsRepository{
    
    static #fakeDocs = [
      {
        "id": 1,
        "filename": "tiny-shakespeare.txt",
        "size": 30089871,
        "selected": false
      },
      {
        "id": 2,
        "filename": "user_data.csv",
        "size": 20341178,
        "selected": false
      },
      {
        "id": 3,
        "filename": "meeting_minutes.docx",
        "size": 5872,
        "selected": false
      },
      {
        "id": 4,
        "filename": "product_catalog.json",
        "size": 23378608,
        "selected": false
      },
      {
        "id": 5,
        "filename": "state_of_the_union.txt",
        "size": 8180088,
        "selected": false
      },
      {
        "id": 6,
        "filename": "sales_data.xlsx",
        "size": 19818086,
        "selected": false
      },
      {
        "id": 7,
        "filename": "article.md",
        "size": 4404,
        "selected": false
      },
      {
        "id": 8,
        "filename": "invoice.pdf",
        "size": 3670,
        "selected": false
      },
      {
        "id": 9,
        "filename": "employee_records.csv",
        "size": 27368709,
        "selected": false
      },
      {
        "id": 10,
        "filename": "project_plan.pptx",
        "size": 13317472,
        "selected": false
      },
      {
        "id": 11,
        "filename": "blog_post.txt",
        "size": 870,
        "selected": false
      },
      {
        "id": 12,
        "filename": "inventory_list.json",
        "size": 26110361,
        "selected": false
      },
      {
        "id": 13,
        "filename": "presentation_notes.doc",
        "size": 6815,
        "selected": false
      },
      {
        "id": 14,
        "filename": "user_feedback.xlsx",
        "size": 186,
        "selected": false
      },
      {
        "id": 15,
        "filename": "report.pdf",
        "size": 31247908,
        "selected": false
      }
    ]  

    static getDocuments(){
        return this.#fakeDocs
    }

    static selectDocument(docIndex : number){
        const newDocs = [...this.#fakeDocs]
        newDocs[docIndex].selected = true
        this.#fakeDocs = [...newDocs]
    }

    static getDocument(docIndex : number){
        return this.#fakeDocs[docIndex]
    }

}
  