package mhacks.com.tin;

import android.support.v7.app.ActionBar;
import android.content.IntentFilter;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import java.util.ArrayList;

public class DirectionsActivity extends AppCompatActivity implements SmsBroadcastReceiver.OnSmsReceivedListener {

    private ArrayList<String> directionsList = new ArrayList<String>();
    private SmsBroadcastReceiver receiver = new SmsBroadcastReceiver();
    private ListAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_directions);
        ActionBar ab = getSupportActionBar();
        ab.setTitle("");
        receiver.setOnSmsReceivedListener(this);

        adapter = new ListAdapter(this, directionsList);

        ListView listView = (ListView)findViewById(R.id.directions_list);
        listView.setAdapter(adapter);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_directions, menu);
        return true;
    }

    @Override
    public void onSmsReceived(String sender, String message)
    {
        if (message.equals("Start") || message.equals("End"))
        {

        }
        else if (message.charAt(0)=='@')
        {
            ActionBar ab = getSupportActionBar();
            ab.setTitle("Meet at: " + message.substring(1));

        }
        else {
            directionsList.add(message);
            adapter.notifyDataSetChanged();
        }

    }

    @Override
    protected void onResume() {
        super.onResume();
        IntentFilter intentFilter = new IntentFilter("android.provider.Telephony.SMS_RECEIVED");
        this.registerReceiver(receiver, intentFilter);
    }

    @Override
    protected void onPause(){
        super.onPause();
        this.unregisterReceiver(receiver);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
