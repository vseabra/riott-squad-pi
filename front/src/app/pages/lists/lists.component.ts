import { Component, OnInit } from '@angular/core';
import { MemberService } from 'src/app/@core/services/member.service';
import { ListService } from 'src/app/@core/services/list.service';
import { environment } from 'src/environments/environment';
import { Member } from 'src/models/member.model';
import { List } from 'src/models/list.model';
import { Lists } from 'src/models/lists.model';
import { Task } from 'src/models/task.model';
import { LocalStorageService } from 'src/app/@core/services/local-storage.service';
import { listRequestBody } from 'src/app/@core/common/interfaces/listRequestBody.interface';
import { TaskService } from 'src/app/@core/services/task.service';
import { TaskMinimum } from 'src/models/taskMinimum.model';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {
  public currentMember: Member;
  public members: Member[];
  public allowance: number = 0;
  public list: List;
  public listManage: Lists;
  public listManageData: List;
  public allTasks: TaskMinimum[];
  public tasks: Task[];
  public tasksManage: Task[];
  public totalDiscount: number = 0;
  public lacks: number = 0;
  public statesList = {"STARTED": "Em andamento", "ONHOLD": "Em espera"};

  constructor(
    private memberService: MemberService,
    private listService: ListService,
    private localStorageService: LocalStorageService,
    private taskService: TaskService) {
  }

  ngOnInit(): void {
    this.getMembers();
    this.getAllTasks();
  }

  getMembers(): void {
    const id = this.localStorageService.getItem("riott:userId");

    this.memberService.List(`${environment.API}user/${id}/members`)
      .subscribe(members => {
        this.members = members.data.children;

        //get the first member
        this.currentMember = members.data.children[0];

        //allowance
        this.allowance = members.data.children[0].allowance;
      });
    
    this.getTaskList(Number(id));
    this.getTaskListForManage(Number(id));
  }

  getTaskList(memberId: number): void {
    this.listService.List(`${environment.API}member/${memberId}/lists`).subscribe(
      lists => {
        this.list = new List();
        this.tasks = [];
        this.list = lists?.data.find(list => list.state == "STARTED");
        
        if (this.list?.state === "STARTED")
          this.tasks = lists?.data?.find(list => list.state == "STARTED").tasks;

        this.calculateTotalAndDiscount();

        //allowance
        this.allowance = this.members.find(member => member.id === memberId).allowance;
      }
    )
  }

  getTaskListForManage(memberId: number): void {
    this.listService.List(`${environment.API}member/${memberId}/lists`).subscribe(
      lists => {
        this.listManage = new Lists();
        this.listManageData = new List();
        this.tasksManage = [];

        this.listManage = lists;

        const statesList = ["STARTED", "ONHOLD"];
        this.listManageData = lists?.data.find(list => statesList.includes(list.state));
      
        if (statesList.includes(this.listManageData?.state)) {
          this.tasksManage = lists?.data.find(list => statesList.includes(list.state)).tasks;
        }
      }
    )
  }

  calculateTotalAndDiscount(): void {
    this.totalDiscount = 0;
    this.lacks = 0;

    //total of missed tasks
    this.tasks?.map(t => {
      if (t.isMissed === true) {
        this.totalDiscount += Number.parseFloat(t.value)
        this.lacks++;
      }
    })
  }

  getAllTasks() {
    this.taskService.List(`${environment.API}task`).subscribe(
      tasks => {
        this.allTasks = tasks.data.rows;
      }
    )
  }

  select(member: Member): void {
    const selected = document.getElementsByClassName('selected')[0];
    
    if (selected) {
      selected.classList.toggle('selected');
    }

    const newSelected: HTMLElement = document.getElementById(member.id.toString());
    newSelected.classList.toggle('selected');

    //set as the current member
    this.currentMember = member;

    if (selected.id != member.id.toString())
      this.getTaskList(member.id);
  }

  selectInManageList(id): void {
    const selected = document.getElementsByClassName('selected-in-manage-list');
    
    if (selected.length > 0) {
      selected.item(0).classList.toggle('selected-in-manage-list');
    }
    
    const newSelected: HTMLElement = document.getElementById(id + 'manage');
    newSelected.classList.toggle('selected-in-manage-list');

    if (selected.item(0).id != id)
      this.getTaskListForManage(id);

    this.activeUserVersionList();
  }

  activeUserVersionList() {
    const initialVersion: HTMLDivElement = document.getElementsByClassName('list-initial').item(0) as HTMLDivElement;
    const userVersion: HTMLDivElement = document.getElementsByClassName('list').item(0) as HTMLDivElement;

    if (initialVersion && userVersion) {
      initialVersion.style.display = "none";
      userVersion.style.removeProperty('display');
    }
  }

  toggleMissed(task: Task): void {
    let body = {
      isMissed: true
    }

    if (task.isMissed) {
      body.isMissed = false;
    }
    else {
      body.isMissed = true;
    }

    this.listService.markAsMissed(`${environment.API}list/task/${task.id}`, body).subscribe(
      result => this.getMembers()
    );
  }

  finalizeList(list: List): void {
    const body: listRequestBody = {
      state: "FINISHED"
    };

    this.listService.patch(`${environment.API}list/${list.id}`, body).subscribe(
      result => this.getMembers()
    );
  }
  
  OpenManageListsModal(): void {
    document.getElementById("filtro").style.display = "block";
    document.getElementById("manageLists").style.display = "flex";
    document.getElementById("manageLists").setAttribute("class", "modal up");
  }

  removeList(id: number) {
    this.listService.Remove(`${environment.API}list/${id}`).subscribe(
      result => this.getTaskListForManage(this.currentMember.id)
    )
  }

  OpenFinalizeListModal(): void {
    document.getElementById("filtro").style.display = "block";
    document.getElementById("finalize-list").style.display = "flex";
    document.getElementById("finalize-list").setAttribute("class", "modal up");
  }
}