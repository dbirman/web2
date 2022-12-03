using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.EventSystems;

public class CardClickBehavior : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void OpenModal(int idx);

    [SerializeField] private CameraRotatorBehavior camRotatorBehav;

    private void OnMouseOver()
    {
        // Play the mouse over animation for this card
    }

    private void OnMouseDown()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Debug.Log("Clicked");
            camRotatorBehav.SetControlBlock(true);
        }
    }

}
