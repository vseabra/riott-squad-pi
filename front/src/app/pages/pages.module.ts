import { NgModule } from "@angular/core";
import { ThemeModule } from "../@theme/theme.module";
import { PagesRoutingModule } from "./pages-routing.module";
import { LoginComponent } from './login/login.component';
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MembersComponent } from "./members/members.component";
import { MyButtonComponent } from "../@theme/components/my-button/my-button.component";
import { ListsComponent } from "./lists/lists.component";
import { HeaderComponent } from "../@theme/components/header/header.component";
import { HistoryComponent } from "./history/history.component";
import { TasksComponent } from "./tasks/tasks.component";
import { PagesAuthGuard } from "./pages-auth.guard";
import { ModalComponent } from "../@theme/components/modal/modal.component";

@NgModule({
	imports: [
        PagesRoutingModule,
        ThemeModule,
				CommonModule,
				ReactiveFormsModule
	],
	declarations: [
		LoginComponent,
		MembersComponent,
		MyButtonComponent,
		ListsComponent,
		HeaderComponent,
		HistoryComponent,
		TasksComponent,
		ModalComponent
	],
	providers: [PagesAuthGuard]
})
export class PagesModule { }
