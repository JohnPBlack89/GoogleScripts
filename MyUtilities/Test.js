function test() {
  var factory = new ToDoListFactory();
  var tasks = factory.create("https://docs.google.com/spreadsheets/d/1Qj8MijIr6ceqWJm_sd0BcwhjauM_TYUopBcsPg3GouE/edit?gid=21711118#gid=21711118");
  // var copyOfFaithful = factory.create("https://docs.google.com/document/d/1AbXABo91gwk7zSzZ0gDobjNYcLipDmaYMiEpB1dylOA/edit?tab=t.k25m12dlba3u")
  
  tasks.organize();
}